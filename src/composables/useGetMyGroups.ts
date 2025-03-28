import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useGetMyGroupsStore } from "@/store/getMyGroups.js";

export const useGetMyGroups = () => {
  const router = useRouter();
  const store = useGetMyGroupsStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchGroups = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      await store.fetchGroups();
    } catch (err: any) {
      error.value = err.message || "Không thể lấy danh sách nhóm.";
      console.error("Lỗi khi gọi API:", err);
    } finally {
      isLoading.value = false;
    }
  };

  const directToGroupDetail = (groupId: number) => {
    router.push({ name: "GroupDetail", params: { id: groupId.toString() } });
  };

  const groups = computed(() => store.groups);

  return {
    groups,
    directToGroupDetail,
    isLoading,
    error,
    fetchGroups,
  };
};
