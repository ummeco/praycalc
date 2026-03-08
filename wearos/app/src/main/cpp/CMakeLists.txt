cmake_minimum_required(VERSION 3.22.1)
project("praycalc_native" C)

# C core source files (referenced from the shared core/c/ directory)
set(CORE_DIR "${CMAKE_SOURCE_DIR}/../../../../../core/c")

add_library(praycalc_native SHARED
    pray_calc_jni.c
    ${CORE_DIR}/nrel_spa.c
    ${CORE_DIR}/pray_calc.c
    ${CORE_DIR}/qibla.c
)

target_include_directories(praycalc_native PRIVATE
    ${CORE_DIR}
)

# Link math library and Android log
target_link_libraries(praycalc_native
    m
    log
)

# C99 standard
set_target_properties(praycalc_native PROPERTIES
    C_STANDARD 99
)
