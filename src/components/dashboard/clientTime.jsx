'use client';
import { useEffect, useState } from 'react';

const ClientTime = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Dhaka',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      };
      setTime(now.toLocaleString('en-US', options));
    };

    updateTime(); // initial render
    const interval = setInterval(updateTime, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-xs md:text-sm mt-1 bg-gradient-to-r  text-white  dark:text-blue-500 bg-clip-text ">
      {time}
    </p>
  );
};

export default ClientTime;
