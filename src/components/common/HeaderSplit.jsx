import { AuthButtonServer } from './Auth-button-server';

export const HeaderSplit = () => {
    return (
        <header className='w-full bg-[#00dffc] h-16'>
            <div className='max-w-screen-lg mx-auto flex justify-between items-center h-full'>
                <a href='/' className='text-white text-2xl font-bold'>SplitBill</a>
                <AuthButtonServer />
            </div>
        </header>
    )
}