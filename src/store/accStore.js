import { accForms, accTemplateForms } from "@/service/acc.service";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAccFormStore = defineStore("acc", () => {
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

export const useAccTemplateStore = defineStore("accTemplate", () => {
  // State
  const templates = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Actions
  const fetchTemplates = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await accTemplateForms();

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const data = await response.json();

      if (data?.data) {
        templates.value = data.data;
      } else {
        throw new Error("Invalid data format received from the API");
      }
    } catch (err) {
      error.value = err.message;
      console.error("Failed to fetch templates:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Getters (optional)
  const activeTemplates = computed(() => {
    return templates.value.filter((template) => template.status === "active");
  });

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    activeTemplates,
  };
});