import prisma from "@repo/db/client"; 
import { SendCard } from "../../../components/SendCard";
import { BalanceCard } from "../../../components/BalanceCard"; 
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth"; 
import { P2Ptransactions } from "../../../components/P2Ptransactions";


async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    console.log(session?.user?.id);
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    }
}

async function getP2PTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.p2pTransfer.findMany({
        where: {
        OR :[
            {fromUserId: Number(session?.user?.id)},
            {toUserId:  Number(session?.user?.id)}
        ]}
    });
    return txns.map(t => ({
        time: t.timestamp,
        amount: t.amount,
        from: t.fromUserId,
        to: t.toUserId,
        orgId : Number(session?.user?.id)
    }))
}

export default async function() {
    const balance = await getBalance();
    const transactions = await getP2PTransactions();

    return <div className="w-screen">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            P2P Transfer
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <div>
                <SendCard/>
            </div>
            <div>
                <BalanceCard amount={balance.amount} locked={balance.locked} />
                <div className="pt-4">
                    <P2Ptransactions transactions={transactions} />
                </div>
            </div>
        </div>
    </div>
}