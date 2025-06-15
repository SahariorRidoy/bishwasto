import React from "react";


const CustomSliderBackground = ({
    image, title1,  description, title2, title4, title5
}) => {
    const styles = {
        container: {
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "",
        },
    };

    return (
        <div
            className="md:h-[600px] h-[300px] w-full md:mt-0 mt-20"
            style={styles.container}>
            <div className="bg-linear-to-r dark:to-gray-800 to-[var(--color-background-teal)] h-full w-full">
                <div className="h-full text-white lg:text-[40px] md:text-[40px] text-xl space-y-2   gap-1 flex items-center justify-end-safe "> 
                    <div className="w-[50%]  bg-linear-to-l dark:to-gray-800 to-[var(--color-background-teal)] p-3 pb-7 pl-6 mr-10">
                        <span className="  leading-none py-2 mr-1 w-fit dark:text-blue-400" >{title1}</span>
                        <span className="  leading-none py-2 mr-1 w-fit text-white" >{title2}</span>
                        <p className="md:text-lg text-sm py-2 md:w-[88%] mr-2">{description}</p>
                        
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSliderBackground;
