interface TotalPillProps {
  values: Array<number | string>;
  tight?: boolean;
}

export function TotalPill({ values, tight = false }: TotalPillProps) {
  const text = values.length >= 2 
    ? `${values[0]}, ${values[values.length - 1]}` 
    : `${values[0]}`;
    
  return (
    <div className={`${tight ? "mt-2" : "mt-3"} mx-auto w-28 text-center text-lg px-3 py-1 rounded-full bg-white/15`}>
      {text}
    </div>
  );
}

