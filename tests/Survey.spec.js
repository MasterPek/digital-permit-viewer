import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Survey from '@/views/pages/permit/Survey.vue';

describe('Survey.vue', () => {
  it('increments count when button is clicked', async () => {
    const wrapper = mount(Survey);
    expect(wrapper.text()).toContain('Count: 0');

    await wrapper.find('button').trigger('click');
    expect(wrapper.text()).toContain('Count: 1');
  });
});