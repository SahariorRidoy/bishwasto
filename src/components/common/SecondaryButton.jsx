import React from 'react';

const SecondaryButton = ({ 
    customClass, 
    bg, 
    buttonName, 
    Icon, 
    onClick 
}) => {
    return (
            <button
                onClick={onClick}
                className={`${customClass ? customClass : ''} ${bg ? bg : 'dark:hover:bg-blue-400/20 hover:bg-green-200'} mr-4 flex items-center text-sm px-3 py-2 border rounded-md hover:cursor-pointer`}
            >
                {Icon && <span className="mr-2">{Icon}</span>}
                {buttonName}
            </button>
    );
};

export default SecondaryButton;