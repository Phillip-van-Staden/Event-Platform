"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { getAllCategories } from "@/lib/actions/category.actions";
import { ICategory } from "@/lib/database/models/category.model";
const CategoryFilter = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();
      categoryList && setCategories(categoryList as ICategory[]);
    };
    getCategories();
  }, []);
  const onSelectCategory = (category: string) => {
    // Create a mutable copy of the search params
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Remove the page parameter when changing category
    newSearchParams.delete("page");

    if (category && category !== "All") {
      newSearchParams.set("category", category);
    } else {
      newSearchParams.delete("category");
    }

    const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
    router.push(newUrl, { scroll: false });
  };
  return (
    <Select onValueChange={(value: string) => onSelectCategory(value)}>
      <SelectTrigger className="select-field">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="All" className="select-item p-regular-14  ">
          All
        </SelectItem>
        {categories.map((category) => (
          <SelectItem
            value={category.name}
            key={category._id}
            className="select-item p-regular-14  "
          >
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;
