import Component_2_4_1 from './Component_2_4_1';
import Component_2_4_2 from './Component_2_4_2';

function Component_2_4() {
  return (
    <section
      id="approach"
      className="opacity-100 [transform:none] caret-[#f0f0f5] px-6 py-32"
      data-component-id="Component_2_4"
    >
      <div className="max-w-[1152px] caret-[#f0f0f5] mx-auto">
        <div className="grid items-start gap-y-16 gap-x-16 grid-cols-[repeat(2,minmax(0px,1fr))] caret-[#f0f0f5]">
          <Component_2_4_1 />
          <Component_2_4_2 />
        </div>
      </div>
    </section>
  );
}

export default Component_2_4;
