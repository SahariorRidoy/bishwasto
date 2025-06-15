import React from 'react'

const TitleDes = ({title, description}) => {
    return (
        <div className="text-center max-w-3xl mx-auto mb-10 ">
            <h2 className="text-4xl font-bold mb-4 dark:text-blue-400 text-gray-800">
                {title}
            </h2>
            <p className="text-lg dark:text-blue-100 text-gray-600">
                {description}
            </p>
        </div>
    )
}

export default TitleDes
