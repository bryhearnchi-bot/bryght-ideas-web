import Component_2_3_1 from './Component_2_3_1';
import Component_2_3_2 from './Component_2_3_2';
import Component_2_3_3 from './Component_2_3_3';
import Component_2_3_4 from './Component_2_3_4';

function Component_2_3() {
  return (
    <section
      id="portfolio"
      className="opacity-100 [transform:none] relative caret-[#f0f0f5] px-6 py-32"
      data-component-id="Component_2_3"
    >
      <div className="max-w-[1152px] caret-[#f0f0f5] mx-auto">
        <div className="absolute -z-10 caret-[#f0f0f5] inset-0">
          <div className="bg-[lab(42.2333_56.9754_-80.6062_/_0.03)] w-[500px] h-[500px] absolute blur-[120px] caret-[#f0f0f5] rounded-br-[1.67772e+07px] rounded-t-[1.67772e+07px] rounded-bl-[1.67772e+07px] left-0 right-auto top-2/4 bottom-auto"></div>
        </div>
        <div className="text-center caret-[#f0f0f5] mb-16">
          <span className="text-[#d4a843] leading-[1.33333] font-medium text-[12px] tracking-[1.2px] uppercase caret-[#d4a843]">
            Our Apps
          </span>
          <h2 className='leading-none [font-family:"Space_Grotesk","Space_Grotesk_Fallback",system-ui,sans-serif] font-bold text-[48px] tracking-[-1.2px] caret-[#f0f0f5] mt-3 mb-0'>
            Building a Portfolio of Products
          </h2>
          <p className="text-[#8892a8] leading-[1.55556] text-[18px] max-w-[576px] caret-[#8892a8] mb-0 mx-auto">
            We don't just build for clients — we build our own apps too. Here's
            a glimpse of what's in the lab.
          </p>
        </div>
        <div className="grid gap-y-6 gap-x-6 grid-cols-[repeat(2,minmax(0px,1fr))] caret-[#f0f0f5]">
          <Component_2_3_1 />
          <Component_2_3_2 />
          <Component_2_3_3 />
          <Component_2_3_4 />
        </div>
      </div>
    </section>
  );
}

export default Component_2_3;
