import { onMounted, onUnmounted, ref } from 'vue'

export function useHeaderComponent() {
  const dropdownOpen = ref(false)
  const groups = ref<string[]>([])
  const selectedGroup = ref('Nhóm làm việc A')
  const menuOpen = ref(false) // Trạng thái mở menu
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
  }

  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value
  }

  const selectGroup = (group: string) => {
    selectedGroup.value = group
    dropdownOpen.value = false
  }

  const fetchGroups = async () => {
    try {
      // const response = await fetch("https://api.example.com/groups");
      // groups.value = await response.json();

      groups.value = ['Nhóm làm việc A', 'Nhóm làm việc B']
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhóm:', error)
    }
  }

  // Đóng menu khi click bên ngoài
  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.menu-container')) {
      menuOpen.value = false
    }
    if (!target.closest('.header__group-selector')) {
      dropdownOpen.value = false
    }
  }

  onMounted(() => {
    fetchGroups().then(r => console.log(r));
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    dropdownOpen,
    groups,
    selectedGroup,
    toggleDropdown,
    selectGroup,
    menuOpen,
    toggleMenu,
  }
}
