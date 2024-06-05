export default function User({ params: { userId } }: { params: { userId: string } }) {
    return (
        <section>
            <h1>User</h1>
            <p>userId: {userId}</p>
        </section>
    )
}