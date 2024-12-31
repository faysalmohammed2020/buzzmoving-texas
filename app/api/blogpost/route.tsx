import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";  // Ensure the correct import path

export async function POST(req: Request) {
  try {
    // Ensure you're parsing the JSON body
    const { title, content, category, tags } = await req.json();

    console.log("Received data:", { title, content });

    // Basic validation
    if (!title || !content || !category || !tags) {
      return new NextResponse("Title and content are required", { status: 400 });
    }

    // Save to database using Prisma
    const newBlogPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        category,
        tags
      },
    });

    console.log("New blog post created:", newBlogPost);

    // Return the newly created blog post
    return new NextResponse(JSON.stringify(newBlogPost), { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return new NextResponse("Failed to create blog post", { status: 500 });
  }
}
