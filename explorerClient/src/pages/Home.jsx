import React from "react";
import Weather from "../components/Weather/Weather";

function Home() {
  return (
    <div className="overflow-x-hidden min-h-screen pt-16 md:pt-[85px]  ">
      <div className="w-screen grid grid-cols-11 md:gap-x-12 px-3 sm:px-7 md:px-10 relative ">
        <div className="col-span-11 md:col-span-3 relative order-1 ">
            <Weather />
        </div>
        <div className="col-span-11 md:col-span-5 shrink-0 order-3 md:order-2 ">
          <h2>Center Component</h2>
        </div>
        <div className="col-span-11 md:col-span-3 relative order-2 md:order-3 ">
          <h2>Right Component</h2>
        </div>
      </div>
    </div>
  );
}

export default Home;
