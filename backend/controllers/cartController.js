import userModel from "../models/userModel.js"

// add products to user cart
const addToCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId
        const { itemId, size } = req.body

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        let cartData = userData.cartData || {}

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            } else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, {
            cartData,
            cartUpdatedAt: new Date(),
            cartReminderSent: false,
        })

        res.json({ success: true, message: "Added To Cart" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update user cart
const updateCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId
        const { itemId, size, quantity } = req.body

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        let cartData = userData.cartData || {}

        if (!cartData[itemId]) cartData[itemId] = {}
        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {
            cartData,
            cartUpdatedAt: new Date(),
            cartReminderSent: false,
        })
        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// get user cart data
const getUserCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId

        const userData = await userModel.findById(userId)
        if (!userData) {
            // No user (e.g. deleted account or non-user token) — return empty cart
            return res.json({ success: true, cartData: {} })
        }

        const cartData = userData.cartData || {}
        res.json({ success: true, cartData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateCart, getUserCart }
