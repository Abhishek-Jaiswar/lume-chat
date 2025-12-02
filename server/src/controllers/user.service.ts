import { User } from "../models/user.model"

export const findUserByIdService = async (userId: string) => {
    return await User.findById(userId)
}