import axios from 'axios'

export async function GET (request: Request) {
  try {
    const data = await axios.get(`${process.env.API_BACKEND}/kanban`)
    console.log(JSON.stringify(data.data))
    return new Response(JSON.stringify(data.data))
  } catch (error) {
    console.log(error)
    return new Response('Error')
  }
}

export async function POST (request: Request) {
  return new Response('POST')
}

