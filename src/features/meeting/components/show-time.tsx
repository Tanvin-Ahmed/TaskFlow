"use client";

import { useEffect, useState } from "react";

const ShowTime = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",
      });
      setTime(time);

      const date = new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
      }).format(now);
      setDate(date);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
      <p className="text-lg font-medium text-sky-600 lg:text-2xl">{date}</p>
    </div>
  );
};

export default ShowTime;
