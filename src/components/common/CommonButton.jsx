import React from 'react'

const CommonButton = ({ customClass, buttonName, Icon }) => {
    return (
        <button className={`${customClass? {customClass}:"dark:bg-button hover:transition-all duration-300 hover:scale-105 dark:text-blue-400 text-[#00ADB5] bg-white px-4"}  cursor-pointer   p-2 rounded-sm flex items-center gap-2`} >
            <p className='md:text-md text-sm  font-bold'> {buttonName}</p>
            {Icon}
        </button>
    )
}

export default CommonButton