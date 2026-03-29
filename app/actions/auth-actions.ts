"use server"

import { createAdminClient } from "@/lib/supabase/auth-admin"
import { sendEmail } from "@/lib/email"
import crypto from 'crypto'

/**
 * Generates a random, secure password
 */
function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let retVal = ""
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(crypto.randomInt(n)))
    }
    return retVal
}

export async function forgotPasswordAction(email: string) {
    if (!email) {
        return { success: false, error: "Email is required" }
    }

    try {
        const supabaseAdmin = createAdminClient()

        // 1. Find user by email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) {
            console.error("Error listing users:", listError)
            return { success: false, error: "Failed to process request" }
        }

        const user = users.find(u => u.email === email)

        if (!user) {
            // Security best practice: don't reveal if user exists
            return { success: true, message: "If your email is registered, you will receive a new password shortly." }
        }

        // 2. Generate unique password
        const newPassword = generateRandomPassword()

        // 3. Update user password in Supabase
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        )

        if (updateError) {
            console.error("Error updating password:", updateError)
            return { success: false, error: "Failed to update password" }
        }

        // 4. Send email with new password
        const emailResult = await sendEmail(
            email,
            "Your New Temporary Password",
            `Hello, \n\nYour password has been reset. Your new temporary password is: ${newPassword} \n\nPlease use this to login and change your password immediately.`,
            `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333;">Password Reset Successful</h2>
                <p>Hello,</p>
                <p>Your password has been reset. Your new temporary password is:</p>
                <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px; margin: 20px 0;">
                    ${newPassword}
                </div>
                <p>Please use this to login and change your password immediately in your account settings.</p>
                <p>Regards,<br/>Store Support Team</p>
            </div>
            `
        )

        if (!emailResult.success) {
            console.error("Error sending email:", emailResult.error)
            return { success: false, error: "Failed to send email" }
        }

        return { success: true, message: "A new password has been sent to your email." }

    } catch (err: any) {
        console.error("Forgot password action error:", err)
        return { success: false, error: err.message || "An unexpected error occurred" }
    }
}
