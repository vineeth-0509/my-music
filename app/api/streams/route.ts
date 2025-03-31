/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
//@ts-expect-error
import youtubeSearchapi from "youtube-search-api";
const YT_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const createStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = createStreamSchema.parse(await req.json());
    const isYt = data.url.match(YT_REGEX);
    if (!isYt) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    //const extractedId = data.url.split("?v=")[1]?.split("&")[0];
    const extractedId = data.url.split("?v=")[1];
    const res = await youtubeSearchapi.GetVideoDetails(extractedId);
    console.log(res.title);
    console.log(res.thumbnail.thumbnails);
    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: {width: number}, b:{width: number}) => a.width < b.width ? -1 : 1);
    const prisma = new PrismaClient();
    const stream = await prisma.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: res.title ?? "Cannot find Video", // Replace "VALID_STREAM_TYPE" with an actual value from your StreamType enum
        smallImg : (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length -1].url) ?? "",
        bigImg: thumbnails[thumbnails.length -1].url ?? "https://up.yimg.com/ib/th?id=OIP.1JPI_t35NPdIJwg3irJ35gHaH_&pid=Api&rs=1&c=1&qlt=95&w=114&h=122"

      },
    });
    return NextResponse.json({
      message: "Added Stream",
      id: stream.id,
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Error while adding a stream",
      },
      {
        status: 411,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const prisma = new PrismaClient();
  const streams = await prisma.stream.findMany({
    where: {
      userId: creatorId ?? "",
    },
  });
  return NextResponse.json({
    streams
  });
}
