'use server'
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export const handleSplitBill = async ({ tripId }: { tripId: string }) => {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: users } = await supabase.from('UserTrip').select('*,users (*)').eq('tripId', tripId)

    const { data: bills } = await supabase.from('Bill').select('*, users (name)').eq('tripId', tripId)

    const { data: userBills } = await supabase.from('UserBill').select('*, users (name)').eq('tripId', tripId)


    // console.log('userBills', userBills)
    // console.log('users', users)
    // console.log('bills', bills)

    type User = {
        id: string;
        tripId: string;
        userId: string;
        users: {
            id: string;
            name: string;
            avatar_url: string;
        };
    };

    type Bill = {
        id: string;
        created_at: string;
        name: string;
        amount: number;
        paidBy: string;
        tripId: string;
        users: {
            name: string;
        };
    };

    type UserBill = {
        id: string;
        userId: string;
        billId: string;
        tripId: string;
        users: {
            name: string;
        };
    };

    // Paso 1: Organizar los datos

    const billParticipants: Record<string, string[]> = {};

    userBills?.forEach(userBill => {
        const { billId, userId } = userBill;
        if (!billParticipants[billId]) {
            billParticipants[billId] = [];
        }
        billParticipants[billId].push(userId);
    });

    // Paso 2: Calcular las deudas

    const userDebts: Record<string, Record<string, number>> = {};

    bills?.forEach(bill => {
        const participants = billParticipants[bill.id];
        const amountPerUser = bill.amount / participants.length;

        participants.forEach(userId => {
            if (userId !== bill.paidBy) {
                if (!userDebts[userId]) {
                    userDebts[userId] = {};
                }
                if (!userDebts[userId][bill.paidBy]) {
                    userDebts[userId][bill.paidBy] = 0;
                }
                userDebts[userId][bill.paidBy] += amountPerUser;
            }
        });
    });

    // Paso 3: Consolidar deudas

    const netDebts: Record<string, number> = {};

    Object.keys(userDebts).forEach(debtor => {
        Object.keys(userDebts[debtor]).forEach(creditor => {
            const amount = userDebts[debtor][creditor];
            if (!netDebts[debtor]) netDebts[debtor] = 0;
            if (!netDebts[creditor]) netDebts[creditor] = 0;
            netDebts[debtor] -= amount;
            netDebts[creditor] += amount;
        });
    });

    const simplifiedTransactions: { from: string, to: string, amount: number }[] = [];

    const positiveBalances = Object.keys(netDebts).filter(userId => netDebts[userId] > 0);
    const negativeBalances = Object.keys(netDebts).filter(userId => netDebts[userId] < 0);

    positiveBalances.forEach(creditor => {
        negativeBalances.forEach(debtor => {
            if (netDebts[creditor] === 0 || netDebts[debtor] === 0) return;
            const amount = Math.min(netDebts[creditor], -netDebts[debtor]);
            if (amount > 0) {
                simplifiedTransactions.push({ from: debtor, to: creditor, amount });
                netDebts[creditor] -= amount;
                netDebts[debtor] += amount;
            }
        });
    });
    let rembolsos: { from: string, to: string, amount: number }[] = []

    // Paso 4: Imprimir los resultados simplificados
    await Promise.all(simplifiedTransactions.map(async transaction => {
        const { data: from } = await supabase.from('users').select('name').eq('id', transaction.from)
        const { data: to } = await supabase.from('users').select('name').eq('id', transaction.to)

        if (from && to) {
            transaction.from = from[0].name
            transaction.to = to[0].name
            rembolsos.push(transaction)
        }
    }));


    return rembolsos
    // revalidatePath(`/trip/${tripId}`)
}