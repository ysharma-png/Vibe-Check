import React from "react";
import { Metadata } from "next";
import { BoardsClient } from "./BoardsClient";

export const metadata: Metadata = {
  title: "Boards & Collections • CacheFlow",
  description: "Curated boards and collections of top AI creators and verified ComfyUI generative workflows.",
};

export default function BoardsPage() {
  return <BoardsClient />;
}
