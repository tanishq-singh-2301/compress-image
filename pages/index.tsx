import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { NextPage } from 'next';
import Head from 'next/head';
import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from 'react';
import Spinner from '../components/basic/spinner';
import classNames from '../lib/basic/classNames';

const units: Array<string> = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

function niceBytes(x: any): string {

  let l = 0, n = parseInt(x, 10) || 0;

  while (n >= 1024 && ++l) {
    n = n / 1024;
  }

  return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

const Home: NextPage = ({ }) => {
  const imageRef: MutableRefObject<HTMLInputElement | null> = useRef(null);
  const [uploading, setUploading] = useState<number>(0);
  const [image, setImage] = useState<{
    size: number,
    url: string,
    originalSize: number
  } | undefined>(undefined);

  useEffect(() => {
    console.log(image);
  }, [image]);

  const handleFile: Function = async (file: File): Promise<void> => {
    if (!file) return alert("File not selected");
    setUploading(0)

    const formData: FormData = new FormData();
    formData.append("image", file, file.name);

    const config: AxiosRequestConfig<FormData> = {
      onUploadProgress: (ev: ProgressEvent) => {
        setUploading(Math.round((ev.loaded / ev.total) * 100))
      }
    }

    await axios.post("/api/compress", formData, config)
      .then((value: AxiosResponse<any, any>) => {
        const { data: axiosData } = value;

        if (axiosData.success) {
          const imageBuffer: Buffer | Uint8Array = Buffer.from(axiosData.data, 'base64');

          const compressedImageSrc: string = URL.createObjectURL(
            new Blob([imageBuffer], { type: 'image/webp' })
          );

          console.log(axiosData.extra ?? "pata nhi kya huya");

          setImage({
            size: imageBuffer.byteLength,
            url: compressedImageSrc,
            originalSize: file.size
          });
        }

        else throw axiosData.error ?? "Something Wrong";
      })
      .catch((reason: any) => {
        if (reason instanceof Error) {
          console.error(reason.message);
          alert(reason.message)
        }

        else {
          console.error(reason);
          alert(reason)
        }

        setUploading(0);
      })
  };

  return (
    <div
      onDrop={async (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0])
          await handleFile(e.dataTransfer.files[0]);
      }}
      onDragOver={e => e.preventDefault()}
      onDragEnter={e => e.preventDefault()}
      onDragLeave={e => e.preventDefault()}
    >
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='h-screen w-full bg-gray-100 flex justify-center items-center'>
        <div className='max-w-md w-5/6 min-h-[15rem] flex justify-center items-center aspect-video rounded-md border-2 border-slate-400 border-dashed bg-slate-50' >
          {!image?.size && <div className={classNames(
            'h-full w-full flex justify-center items-center flex-col',
          )}>
            <div>
              <span className='text-base font-medium text-slate-700'>Drop image to start uploading</span>
            </div>
            <div className='w-full flex justify-center items-center my-2 lg:my-3'>
              <div className="h-px w-1/5 bg-gray-400"></div>
              <span className='text-base text-gray-500'>&ensp;OR&ensp;</span>
              <div className="h-px w-1/5 bg-gray-400"></div>
            </div>
            <div>
              <button
                className={classNames(
                  'py-2 px-6 relative rounded-md hover:shadow-lg duration-500 overflow-hidden',
                  uploading > 0 ? 'bg-indigo-400' : 'bg-indigo-500'
                )}
                onClick={() => {
                  if (imageRef.current) {
                    setUploading(0);
                    imageRef.current.value = "";
                    imageRef.current.click();
                  }
                }}
              >
                <span className={classNames(
                  'text-base font-medium text-slate-100 duration-500',
                  uploading > 0 ? 'opacity-0' : ''
                )}>
                  Browse file
                </span>

                <div className={classNames(
                  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-slate-100 duration-500 flex items-center',
                  !uploading ? 'opacity-0' : ''
                )}>
                  {uploading === 100 && <Spinner color='#fff' height={20} />}
                  <span className={classNames(
                    'text-base font-medium',
                    uploading === 100 ? "ml-2" : ""
                  )}>{uploading === 100 ? "Processing" : "Uploading"}</span>
                </div>

                <div
                  className={classNames(
                    'absolute h-full bg-indigo-700 top-0 left-0 duration-500',
                    uploading > 0 ? '' : 'w-0'
                  )}
                  style={{
                    width: `${Math.min(uploading, 100)}%`
                  }}
                ></div>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={imageRef}
                className="hidden"
                onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                  if (event.target.files && event.target.files[0])
                    await handleFile(event.target.files[0]);
                }}
              />
            </div>
          </div>}

          {image?.size && <div className={classNames(
            'h-full w-full flex justify-center items-center flex-col'
          )}>
            <div>
              <span className='text-6xl font-medium text-black'>{Math.floor(image.originalSize / image.size)}%</span>
              <span className='text-base font-medium text-black'>Saved</span>
            </div>
            <div className='px-4 py-2 rounded-md bg-teal-500 my-4'>
              <a href={image.url} rel="noreferrer" download="image.png" target="_blank">
                <span className='text-base font-medium'>Download - {niceBytes(image.size)}</span>
              </a>
            </div>
            <div>
              <span
                className='text-base font-normal text-black cursor-pointer'
                onClick={() => {
                  setImage(undefined);
                  setUploading(0);
                }}
              >upload another</span>
            </div>
          </div>}
        </div>
      </main>
    </div>
  );
};

export default Home;
