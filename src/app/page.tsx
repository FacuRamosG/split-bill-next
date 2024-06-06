
import { createRouteHandlerClient, createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 } from "uuid";


export default async function Home() {

  const supabase = createRouteHandlerClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()


  const { data, error } = await supabase.from('UserTrip').select('*,Trip (*)').eq('userId', session?.user.id)

  //arreglar esto
  let trips: ({} | null)[] = []
  data && data.length > 0 && await Promise.all(data.map(async (trip: any) => {
    const { data } = await supabase.from('Trip').select('*').eq('id', trip.tripId)
    trips.push(data)
  }))

  const addTrip = async (formdata: FormData) => {
    'use server'
    const tripName = formdata.get('tripName')
    if (!tripName) return
    if (!session) return

    const supainsert = createServerActionClient({ cookies })
    const id = v4()


    const { error } = await supainsert.from('Trip').insert([{ id, name: tripName, created_by: session?.user.id }])
    if (error) {
      console.log('Error al ingresar un nuevo viaje', error)
      return
    }
    const { error: error2 } = await supainsert.from('UserTrip').insert([{ userId: session?.user.id, tripId: id }])
    if (error2) {
      console.log('Error al ingresar un nuevo viaje', error2)
      return
    }
    revalidatePath(`/`)
  }



  return (
    <main className="flex  flex-col items-center justify-between p-24">

      {/* <Header /> */}
      {
        session && (
          <section className="p-4 max-w-3xl m-auto">
            <h1 className="title">Tus viajes</h1>
            {
              trips.length > 0 && trips.map((trip: any) => {
                return (
                  <a href={`/trip/${trip[0].id}`} key={trip[0].id}>
                    <div className=" shadow-lg rounded-lg p-4 mb-4 hover:scale-110">
                      <h2 className="text-xl font-bold">{trip[0].name}</h2>
                    </div>
                  </a>
                )
              })
            }

            <h1 className="title mt-6">Agrega un viaje nuevo</h1>
            <form action={addTrip}>
              <div>
                <label htmlFor="trip_name" className="block mb-2 textP font-medium text-gray-900 ">Trip name</label>
                <input type="text" id="trip_name" name="tripName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="Perú,España,..." required />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 p-2 border text-white rounded-lg px-4 py-2">Agregar viaje</button>
            </form>

          </section>
        )
      }
      <div className="text-center">
        <h1 className="title">Welcome to SplitBill</h1>
        <p className="textP">
          This is a simple app to split bills among friends.
          You can add bills, add friends, and split the bill among friends.
        </p>
      </div>

    </main>
  );
}
