const {Clients, Rooms, RoomsClients} = require('../models')
const { Op } = require("sequelize");
const utils = require('./utils')
const fs = require('fs')
const path = require('path')
const createError = require('http-errors')

async function createClient(value, code, adminId) {
    if (adminId) {
        const admin = await utils.findAdmin(adminId)
    } else {
        const room = await Rooms.findOne({
            where: {
                code: code
            }
        })
    
        if (!room) {
            throw createError(404, "Room  was not found")
        }
    }

    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    let password = ""
    for (let i=0;i<8;i++) {
        password += chars[utils.getRandomInt(0, chars.length)]
    }
    value.password = password
    const client = await Clients.create(value)
    return client
} 

async function getClientInfo(adminId, password, clientId) {
    if (adminId) {
        const admin = await utils.findAdmin(adminId)
    } else {
        const clientExist = await Clients.findOne({
            where: {
                id: clientId,
                password: password
            }
        })
        if (!clientExist) {
            throw createError(404, "Username of password are false")
        }
    }
    const client = await utils.findClient(clientId)
    return client
}

async function updateClient(adminid, clientId, value) {
    const admin = await utils.findAdmin(adminid)
    const client = await utils.findClient(clientId)

    if (value.photo) {
        const photoPath = path.join(__dirname, "../../public/", client.photo)
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath)
    }
    client.set(value)
    await client.save()
    return client
}

async function deleteClient(adminid, clientId) {
    const admin = await utils.findAdmin(adminid)
    const client = await utils.findClient(clientId)

    if (client.photo) {
        const photoPath = path.join(__dirname, "../../public/", client.photo)
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath)
    }

    await client.destroy()
}

async function getClientsList(adminId, query) {
    const admin = await utils.findAdmin(adminId)
    
    const request = {
        where: {}
    }

    if (query.limit) request.limit = query.limit
    if (query.offset) request.offset = query.offset
    if (query.id) request.where.id = query.id
    if (query.phone) request.where.phone = {[Op.startsWith]:query.phone}
    if (query.firstName) request.where.firstName = {[Op.startsWith]:query.firstName}
    if (query.lastName) request.where.lastName = {[Op.startsWith]:query.lastName}

    const clients = await Clients.findAll(request)
    return clients
}

async function connectClientWithRoom(adminId, password, roomId, clientId, filename) {
    if (adminId) {
        const admin = await utils.findAdmin(adminId)
        const client = await utils.findClient(clientId)
        const room = await Rooms.findOne({
            where: {
                id: roomId,
                isActivate: true
            }
        })
        if (!room) {
            throw createError(404, "Room was not found")
        }
        const location = await utils.findLocation(room.LocationId)
        if (!await location.hasAdmin(admin) && !admin.isSuperAdmin) {
            throw createError(403, "You has no premmision")
        }
        if (await room.hasClient(client)) {
            throw createError(400, "You are already in this room")
        }
        const game = await utils.findGame(room.GameId)
        if (game.maxPlayers <= await room.countClients()) {
            throw createError(400, "Room is already full")
        }

        await RoomsClients.create({
            ClientId: clientId,
            RoomId: roomId,
            clientSignature: filename
        })
    } else {
        const client = await Clients.findOne({
            where: {
                id: clientId,
                password: password
            }
        })

        const room = await Rooms.findOne({
            where: {
                id: roomId,
                isActivate: true
            }
        })
        if (!room) {
            throw createError(404, "Room was not found")
        }
        if (await room.hasClient(client)) {
            throw createError(400, "You are already in this room")
        }
        const game = await utils.findGame(room.GameId)
        if (game.maxPlayers <= await room.countClients()) {
            throw createError(400, "Room is already full")
        }

        await RoomsClients.create({
            ClientId: clientId,
            RoomId: roomId,
            clientSignature: filename
        })
    }
}

async function deleteClientFromRoom(adminId, clientId, roomId) {
    const admin = await utils.findAdmin(adminId)
    const client = await utils.findClient(clientId)
    const room = await utils.findRoom(roomId)

    const roomsClients = await RoomsClients.findOne({
        where: {
            RoomId: roomId,
            ClientId: clientId
        }
    })
    if (!roomsClients) {
        throw createError(404, "This user is not in this room")
    }

    const location = await utils.findLocation(room.LocationId)
    if (!await location.hasAdmin(admin) && !admin.isSuperAdmin) {
        throw createError(403, "You has no premmision")
    }

    if (roomsClients.clientSignature) {
        const photoPath = path.join(__dirname, "../../public/", roomsClients.clientSignature)
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath)
    }
    await roomsClients.destroy()
}

async function getListOfClients(adminId, roomId) {
    const admin = await utils.findAdmin(adminId)
    const room = await utils.findRoom(roomId)

    const location = await utils.findLocation(room.LocationId)
    if (!await location.hasAdmin(admin) && !admin.isSuperAdmin) {
        throw createError(403, "You has no premmision")
    }

    const data = await room.getClients()
    return data
}

async function getListOfRoomsOfClient(adminId, password, clientId) {
    if (adminId) {
        const admin = await utils.findAdmin(adminId)
        const client = await utils.findClient(clientId)
        return client.getRooms()
    } else {
        const client = await Clients.findOne({
            where: {
                id: clientId,
                password: password
            }
        })
        if (!client) {
            throw createError(404, "Client not found")
        }
        return client.getRooms()
    }
}

module.exports = {
    createClient,
    getClientInfo,
    updateClient,
    deleteClient,
    getClientsList,
    connectClientWithRoom,
    deleteClientFromRoom,
    getListOfClients,
    getListOfRoomsOfClient
}