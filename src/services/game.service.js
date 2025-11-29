const {Games, Locations, Admins} = require('../models/')
const utils = require('./utils')
const createError = require('http-errors')
const fs = require('fs');
const path = require('path')

async function createGame(value, locationId, adminId) {
    const location = await utils.findLocation(locationId)
    const admin = await utils.findAdmin(adminId)

    if (await admin.hasLocation(location) || admin.isSuperAdmin) {
        return await Games.create(value)
    } else {
        throw  createError(400, "You have no premmision to do that")
    }
}

async function getGameListOnLocation(locationId) {
    const location = await utils.findLocation(locationId)

    return await location.getGames()
}

async function getGameInfoOnLocation(locationId, gameId) {
    const location = await utils.findLocation(locationId)
    const game = await utils.findGame(gameId)

    if (!(await location.hasGame(game))) {
        throw createError(404, "Game not found on this location")
    }

    return game
}

async function deleteGameOnLocation(locationId, gameId, adminId) {
    const location = await utils.findLocation(locationId)
    const game = await utils.findGame(gameId)
    const admin = await utils.findAdmin(adminId)

    if ((await location.hasGame(game) && await location.hasAdmin(admin)) || admin.isSuperAdmin) {
        const iconPath = path.join(__dirname, '../../public/', game.icon)
        if (game.icon && fs.existsSync(iconPath)) {
            fs.unlinkSync(iconPath)
        }
        await game.destroy()
    } else {
        throw createError(400, "You have no permission or this game doesn’t belong to this location")
    }
} 

async function updateGameOnLocation(locationId, gameId, adminId, value) {
    const location = await utils.findLocation(locationId)
    const game = await utils.findGame(gameId)
    const admin = await utils.findAdmin(adminId)

    if ((await location.hasGame(game) && await location.hasAdmin(admin)) || admin.isSuperAdmin) {
        const iconPath = path.join(__dirname, '../../public/', game.icon)
        if (value.icon && fs.existsSync(iconPath)) {
            fs.unlinkSync(iconPath)
        }
        game.set(value)
        await game.save()
        return game
    } else {
        throw createError(400, "You have no permission or this game doesn’t belong to this location")
    }
}

module.exports = {
    createGame,
    getGameListOnLocation,
    getGameInfoOnLocation,
    deleteGameOnLocation,
    updateGameOnLocation
}