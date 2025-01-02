import { accForms } from "@/service/acc.service";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccStore = defineStore("acc", () => {
  const forms = ref([]);
  const items = ref([]);
  const selectedForm = ref(null);

  const fetchForms = async () => {
    try {
      const res = await accForms();
      const data = await res.json();
      forms.value = data.data;

      items.value = forms.value.map((form) => ({
        label: form.name,
        form: form,
        command: () => {
          setSelectedForm(form);
        },
      }));

      console.log("Forms fetched:", forms.value);
      return data;
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  const setSelectedForm = (form) => {
    selectedForm.value = form;
    console.log("Selected form:", form);
  };

  return {
    forms,
    items,
    selectedForm,
    fetchForms,
    setSelectedForm,
  };
});