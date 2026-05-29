#!/bin/bash
echo "Components missing tests:"
for component_file in $(find nextjs-app/shared/components -maxdepth 2 -name "*.tsx" -not -name "*.stories.tsx" -not -name "*.test.tsx" -not -name "*.a11y.test.tsx" | sort); do
  component_dir=$(dirname "$component_file")
  component_name=$(basename "$component_file" .tsx)
  test_file="${component_dir}/${component_name}.test.tsx"
  if [ ! -f "$test_file" ]; then
    echo "$component_file -> $test_file (missing)"
  fi
done
