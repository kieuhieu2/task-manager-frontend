import { defineStore } from "pinia";
import { fetchGetMyGroups } from "@/api/getMyGroups.js";
import type { Group } from "@/types/group.js";
import { ref } from 'vue'

export const useGetMyGroupsStore = defineStore("getMyGroups", () => {
  const groups = ref<Group[]>([]);

  const fetchGroups = async () => {
    try {
      groups.value = await fetchGetMyGroups();
    } catch (error) {
      groups.value = []; // Reset groups nếu lỗi
      throw error;
    }
  };

  return {
    groups,
    fetchGroups,
  };
});

