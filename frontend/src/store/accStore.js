import { accForms, accMe, accTemplateForms } from "@/service/acc.service";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAccStore = defineStore("accStore", {
    state: () => ({
        user: null,
        forms: [],
        items: [],
        selectedForm: null,
    }),

    actions: {
        async fetchUsers() {
          // if (this.user) return

            const res = await accMe();

            if (res.ok) {
                const data = await res.json();
                this.user = data;
              }
        },
        async fetchForms() {
            try {
                const res = await accForms();
                const data = await res.json();
                this.forms = data.data;

                this.items = this.forms.map((form) => ({
                    label: form.name,
                    form: form,
                    command: () => {
                        this.setSelectedForm(form);
                    },
                }));

                return data;
            } catch (error) {
                console.error("Error fetching forms:", error);
            }
        },

        setSelectedForm(form) {
            this.selectedForm = form;
            console.log("Selected form:", form);
        },
    },
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
                throw new Error(
                    `Failed to fetch templates: ${response.statusText}`,
                );
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
        return templates.value.filter(
            (template) => template.status === "active",
        );
    });

    return {
        templates,
        isLoading,
        error,
        fetchTemplates,
        activeTemplates,
    };
});
