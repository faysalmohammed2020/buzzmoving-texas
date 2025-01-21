import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma"; // Ensure the correct import path

// ✅ CREATE A NEW BLOG POST
export async function POST(req: Request) {
  try {
    const { post_title, post_content, category, tags } = await req.json();

    console.log("Received data for new post:", {
      post_title,
      post_content,
      category,
      tags,
    });

    if (!post_title || !post_content || !category || !tags) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const post_name = post_title.toLowerCase().replace(/\s+/g, "-"); // ✅ Generate `post_name` from `post_title`

    const newBlogPost = await prisma.blogPost.create({
      data: {
        post_title,
        post_content,
        category,
        tags,
        post_name, // ✅ Include the required `post_name` field
      },
    });

    console.log("New blog post created:", newBlogPost);

    return NextResponse.json(newBlogPost, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE AN EXISTING BLOG POST
export async function PUT(req: Request) {
  try {
    const { id, post_title, post_content, category, tags } = await req.json();

    console.log("Received update data:", {
      id,
      post_title,
      post_content,
      category,
      tags,
    });

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required for updating" },
        { status: 400 }
      );
    }

    const existingPost = await prisma.blogPost.findUnique({ where: { id } });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post_name = post_title
      ? post_title.toLowerCase().replace(/\s+/g, "-")
      : existingPost.post_name;

    // ✅ Update only modified fields
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        post_title,
        post_content,
        category,
        tags,
        post_name, // ✅ Ensure `post_name` is updated if `post_title` changes
      },
    });

    console.log("Updated blog post:", updatedPost);

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}
