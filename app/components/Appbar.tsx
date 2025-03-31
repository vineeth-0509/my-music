'use client'
import {signIn, signOut, useSession} from "next-auth/react"
export function Appbar(){
    const session = useSession();
    return (
        <div>
            <div className="flex justify-between">
                <div>
                    my-music
                </div>
                <div>
                    {session.data?.user && <button className='border rounded-md border-black m-2 p2- bg-blue-400 font-bold text-sm' onClick={() => signOut()}>LogOut</button> }
                  { !session.data?.user && <button className='m-2 p-2 bg-blue-400' onClick={()=> signIn()}>SignIn</button>}
                   
                </div>
            </div>
        </div>
    )
}