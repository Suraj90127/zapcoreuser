import React, { useState } from "react";
import { TbSearch } from "react-icons/tb";

const SideBar = ({ endpoints, activeEndpoint, onSelectEndpoint }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEndpoints = endpoints.filter((endpoint) =>
        endpoint.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className="h-full flex flex-col bg-white border-r border-gray-200 w-72">

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    Rapid
                </h1>
            </div>

            {/* Version */}
            <div className="px-6 py-4 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                    Version
                </span>
                <div className="mt-2 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-md text-xs font-medium border">
                    1.0.0 (current)
                </div>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <TbSearch className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search endpoints..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Endpoints */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                {filteredEndpoints.map((item) => {
                    const isActive = activeEndpoint?.name === item.name;

                    return (
                        <button
                            key={item.name}
                            onClick={() => onSelectEndpoint(item)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition
              ${isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                        >
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">
                                {item.method}
                            </span>

                            <span className="truncate font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default SideBar;