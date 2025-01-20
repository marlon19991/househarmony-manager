<template>
  <div>
    // ...existing code...
    <v-select
      v-model="selectedResponsible"
      :items="responsibleOptions"
      @change="handleResponsibleChange"
    />
    // ...existing code...
    <v-checkbox
      v-for="(task, index) in tasks"
      :key="index"
      v-model="taskStates[index]"
      :label="task"
      @change="updateProgress"
    />
    // ...existing code...
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'

export default {
  name: 'HaceoGeneral',
  setup() {
    const selectedResponsible = ref('')
    const taskStates = ref([])
    const progress = ref(0)
    
    const tasks = [
      // ...existing task array...
    ]

    // Initialize taskStates
    onMounted(() => {
      taskStates.value = new Array(tasks.length).fill(false)
      const savedState = localStorage.getItem('haceoGeneralState')
      if (savedState) {
        const state = JSON.parse(savedState)
        if (state.responsible === selectedResponsible.value) {
          taskStates.value = state.tasks
          updateProgress()
        }
      }
    })

    const handleResponsibleChange = () => {
      // Reset tasks when responsible person changes
      taskStates.value = new Array(tasks.length).fill(false)
      progress.value = 0
      saveState()
    }

    const updateProgress = () => {
      const completedTasks = taskStates.value.filter(state => state).length
      progress.value = (completedTasks / tasks.length) * 100
      saveState()
    }

    const saveState = () => {
      localStorage.setItem('haceoGeneralState', JSON.stringify({
        responsible: selectedResponsible.value,
        tasks: taskStates.value
      }))
    }

    // Watch for tab changes
    watch(() => selectedResponsible.value, () => {
      const savedState = localStorage.getItem('haceoGeneralState')
      if (savedState) {
        const state = JSON.parse(savedState)
        if (state.responsible === selectedResponsible.value) {
          taskStates.value = state.tasks
          updateProgress()
        }
      }
    })

    return {
      selectedResponsible,
      taskStates,
      progress,
      tasks,
      handleResponsibleChange,
      updateProgress
    }
  }
}
</script>
