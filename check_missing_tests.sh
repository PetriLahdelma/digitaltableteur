#!/bin/bash

echo "Components missing tests:"
echo "========================"

for component_file in $(find src/components -name "*.tsx" -not -name "*.stories.tsx" -not -name "*.test.tsx" | sort); do
    component_dir=$(dirname "$component_file")
    component_name=$(basename "$component_file" .tsx)
    test_file="${component_dir}/${component_name}.test.tsx"
    
    if [ ! -f "$test_file" ]; then
        echo "$component_file -> $test_file (missing)"
    fi
done
