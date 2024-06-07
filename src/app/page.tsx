import { AddNewTrip } from "@/components/common/AddNewTrip";
import { createRouteHandlerClient, createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { v4 } from "uuid";


export default async function Home() {

  const supabase = createRouteHandlerClient({ cookies })


  const { data: { session } } = await supabase.auth.getSession()


  const { data, error } = await supabase.from('UserTrip').select('*,Trip (*)').eq('userId', session?.user.id)

  //arreglar esto
  let trips: ({} | null)[] = []
  data && data.length > 0 && await Promise.all(data.map(async (trip: any) => {
    const { data } = await supabase.from('Trip').select('*').eq('id', trip.tripId).order('created_at', { ascending: false })
    trips.push(data)
  }))

  return (
    <main className="flex  flex-col items-center justify-between mt-16 px-5 sm:px-0">

      <Toaster />
      <div className="text-center mb-10">
        <h1 className="title text-5xl">SplitBill</h1>

      </div>
      {
        session && (
          <section className="max-w-screen-lg m-auto flex sm:flex-row flex-col gap-28 w-full justify-between items-start">
            <div className="w-full">
              {trips.length > 0 ? <h1 className="title">Tus viajes</h1> : <h1 className="title text-xl text-wrap max-w-[400px]">No tienes ningun viaje, inicia uno nuevo o súmate al de tus amigos</h1>}
              {
                trips.length > 0 && trips.map((trip: any) => {
                  return (
                    <a href={`/trip/${trip[0].id}`} key={trip[0].id}>
                      <div className=" shadow-lg rounded-lg p-4 mb-4 hover:scale-105">
                        <h2 className="text-xl font-bold">{trip[0].name}</h2>
                      </div>
                    </a>
                  )
                })
              }
            </div>

            <AddNewTrip created_by={session.user.id} />
          </section>
        )
      }


    </main>
  );
}
