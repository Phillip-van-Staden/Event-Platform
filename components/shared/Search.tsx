"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const Search = ({
  placeholder = "Search title...",
}: {
  placeholder?: string;
}) => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Get the current query from the URL search parameters
      const currentUrlQuery = searchParams.get("query") || "";

      // Only update the URL if the user has typed a new query
      if (query !== currentUrlQuery) {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        if (query) {
          newSearchParams.set("query", query);
        } else {
          newSearchParams.delete("query");
        }

        // This is a new search, so we must reset to page 1
        newSearchParams.delete("page");

        const newUrl = `${
          window.location.pathname
        }?${newSearchParams.toString()}`;
        router.push(newUrl, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchParams, router]);
  return (
    <div className="input-field flex-center min-h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2 ">
      <Image
        src={"/assets/icons/search.svg"}
        alt="search"
        width={24}
        height={24}
      />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        className="input-field  border-0 focus:ring-0 focus:outline-0
         placeholder:text-gray-500 focus:border-0 focus-visible:ring-0 
         focus-visible:ring-offset-0 shadow-none focus:shadow-none"
      />
    </div>
  );
};

export default Search;
