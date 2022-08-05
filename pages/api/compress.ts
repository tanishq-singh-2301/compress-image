import sharp from 'sharp';
import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { File } from 'multiparty';
import parseForm from '../../middleware/parseForm';
import { readFile } from 'fs';

type Data = {
  success: boolean,
  data?: any,
  error?: any,
  extra?: any
}

const handler = nc();
handler.use(parseForm);

handler.post(async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    const { files } = req as any;
    const image: File = files['image'][0] as File;

    readFile(image.path, async (err: NodeJS.ErrnoException | null, data: Buffer) => {
      if (err) throw err.message;

      await sharp(data)
        .webp({ quality: 30, effort: 6 })
        .toBuffer()
        .then((value: Buffer) => {
          // res.setHeader("Content-Type", "image/webp");
          // res.setHeader("Content-Length", value.byteLength);
          // return res.status(200).end(value);
          res.status(200).json({
            success: true,
            data: Buffer.from(value).toString("base64"),
            extra: image.path
          })
        });
    });
  } catch (error) {
    return res.status(200).json({ success: true, error })
  }
});

export const config = {
  api: {
    bodyParser: false
  }
}

export default handler;
