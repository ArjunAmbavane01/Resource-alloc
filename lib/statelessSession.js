import 'server-only'
import {SignJWT, jwtVerify} from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const key = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

const cookie = {
    name: 'session',
    options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/'
    },
    duration: 24 * 60 * 60 * 1000,
}

export async function encrypt(payload){
    return new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime('1day')
        .sign(key)
}

export async function decrypt(session){
    try {
        const {payload} = await jwtVerify(session, key);
        return payload
    } catch(error) {
        return null
    }   
}

export async function createSession(userId, type) {
    const expires = new Date(Date.now() + cookie.duration);
    const session = await encrypt({ userId, expires});
    const newType = await encrypt({ type, expires});
    cookies().set(cookie.name, session, {...cookie.options, expires});

    if(type === 'resource'){
        cookies().set("type", newType, {...cookie.options, expires});
    }else if(type === 'hospital'){
        cookies().set("type", newType, {...cookie.options, expires});
    }
    if(type === 'resource'){
        redirect('/resources/dashboard');
    }
    if(type === 'hospital'){
        redirect('/hospital/dashboard');
    }
    // redirect('/dashboard');
}




export async function verifySession() {
    const cookie = cookies().get('session')?.value 
    const session = await decrypt(cookie);
    if(!session?.userId)
        redirect('/login');

    return {userId: session.userId}
}

export async function deleteSession() {
    cookies().delete(cookie.name);
    redirect('/login');
}