
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

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
