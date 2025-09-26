import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        skinType: true,
        skinConcerns: true,
        skinGoals: true,
        allergies: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { firstName, lastName, avatar, skinType, skinConcerns, skinGoals, allergies } = await request.json()

    const updateData: any = {}
    
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (avatar !== undefined) updateData.avatar = avatar
    if (skinType !== undefined) updateData.skinType = skinType
    if (skinConcerns !== undefined) updateData.skinConcerns = skinConcerns
    if (skinGoals !== undefined) updateData.skinGoals = skinGoals
    if (allergies !== undefined) updateData.allergies = allergies

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        skinType: true,
        skinConcerns: true,
        skinGoals: true,
        allergies: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user 
    })

  } catch (error) {
    console.error("Update user profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
