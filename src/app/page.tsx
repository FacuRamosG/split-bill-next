import { AddNewTrip } from "@/components/common/AddNewTrip";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Toaster } from "sonner";


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
    <main className="flex max-w-screen-lg mx-auto  flex-col items-center justify-between mt-10 px-5 sm:px-0">

      <Toaster />
      <div className="flex gap-10 mb-10">
        <div className="flex flex-col justify-center items-center">
          <h2 className="title text-5xl text-balance ">Organiza y divide de manera sencilla</h2>
          <p className="textP ">La forma mas simple de organizar tus gastos compartidos</p>

        </div>
        <div className="">
          <img src="/peopleSplit.jpeg" className="hidden lg:block" alt="people" height={500} width={600} />
        </div>
      </div>
      {
        session ? (
          <section className="max-w-screen-lg mx-auto flex sm:flex-row flex-col gap-28 w-full justify-between items-start m-24">
            <div className="w-full">
              {trips.length > 0 ? <h1 className="title text-xl">Tus viajes</h1> : <h1 className="title text-xl text-wrap max-w-[400px]">No tienes ningun viaje, inicia uno nuevo o súmate al de tus amigos</h1>}
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
          : (
            <section>
              <h1 className="title text-2xl">Inicia sesión para ver tus viajes, crear nuevos o unirte al de tus amigos</h1>
            </section>
          )
      }


    </main>
  );
}

