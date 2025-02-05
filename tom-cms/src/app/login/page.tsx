import LoggedUserServer from "@/components/LoggedUserServer";
import { auth } from "@/libs/auth";
import { redirect } from 'next/navigation';
import styles from '@/app/login/page.module.css';

export async function generateMetadata(){
    return {
        title: 'Login',
        description: 'Login to continue',
    };
}

export default async function LoginPage() {
    const session = await auth();
    if (session) {
        return redirect('/admin/dashboard');
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Login</h1>
            <p className={styles.subtitle}>Please sign in to continue.</p>
            <LoggedUserServer />
        </div>
    )
}