import React from "react";

function Tags() {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow">
        <h2 className="mb-4 font-bold"># Trending Hashtags</h2>
        <ul className="list-disc pl-4">
          <li><button className="hover:text-[#ae7aff]">#javascript</button></li>
          <li><button className="hover:text-[#ae7aff]">#typescript</button></li>
          <li><button className="hover:text-[#ae7aff]">#java</button></li>
          <li><button className="hover:text-[#ae7aff]">#python</button></li>
          <li><button className="hover:text-[#ae7aff]">#golang</button></li>
        </ul>
    </div>
  );
}

export default Tags;
