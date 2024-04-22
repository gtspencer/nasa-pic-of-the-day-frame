/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { pinata } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import axios from "axios"

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  headers: {
    'cache-control': 'max-age=0',
  },
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": process.env.AIRSTACK_API_KEY ? process.env.AIRSTACK_API_KEY : "",
      }
    }
  }
})

app.frame('/', (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 50,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        > NASA Pic of the Day
        </div>
      </div>
    ),
    intents: [
        <Button>Check</Button>,
    ],
    action: '/result'
  })
})

app.frame('/result', async (c) => {
  const { verified, frameData } = c

  if (!verified) {
    return ReturnUnverified(c, "Please login to Farcaster")
  }

  const senderFid = frameData?.fid

  if (!senderFid) {
    return ReturnUnverified(c, "Please login to farcaster")
  }

  let response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`)

  const data = response.data

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background:'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 20,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 5,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {data.title}
        </div>
        <img src={data.url}  style={{
            maxWidth: '600px', /* Set maximum width */
            maxHeight: '600px', /* Set maximum height */
            alignSelf: 'center', /* Align image to center horizontally */
        }}/>
      </div>
    ),
    imageAspectRatio: '1:1',
    intents: [
      <Button.Redirect location='https://apod.nasa.gov/apod/'>More Info</Button.Redirect>
    ]
  })
})

function ReturnUnverified(c: any, message: string) {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        > {`${message}`}
        </div>
      </div>
    ),
  })
}

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
