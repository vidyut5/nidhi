// Stub for static export builds where app/api is stripped
declare module "@/app/api/uploadthing/core" {
  import type { FileRouter } from "uploadthing/server"
  export type OurFileRouter = FileRouter
}


