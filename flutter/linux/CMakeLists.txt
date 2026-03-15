# Project-level configuration.
cmake_minimum_required(VERSION 3.10)
project(runner LANGUAGES CXX)

# The name of the executable created for the application.
# Change this to change the on-disk name of your application.
set(BINARY_NAME "praycalc_app")

# Explicitly opt in to modern CMake behaviors to avoid warnings with recent
# versions of CMake.
cmake_policy(VERSION 3.10...3.25)

# Define build configuration option.
get_property(IS_MULTICONFIG GLOBAL PROPERTY GENERATOR_IS_MULTI_CONFIG)
if(IS_MULTICONFIG)
  set(CMAKE_CONFIGURATION_TYPES "Debug;Profile;Release"
    CACHE STRING "" FORCE)
else()
  if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_BUILD_TYPE "Debug" CACHE
      STRING "Flutter build mode" FORCE)
    set_property(CACHE CMAKE_BUILD_TYPE PROPERTY STRINGS
      "Debug" "Profile" "Release")
  endif()
endif()

# Define settings for the application build.
set(CMAKE_INSTALL_RPATH "$ORIGIN/lib")

# If the flutter tool didn't set CMAKE_INSTALL_PREFIX (leaving the cmake
# default /usr/local), redirect the install to the expected bundle directory
# so that cmake --install doesn't require root access.
if(CMAKE_INSTALL_PREFIX_INITIALIZED_TO_DEFAULT)
  set(CMAKE_INSTALL_PREFIX "${CMAKE_CURRENT_BINARY_DIR}/bundle"
    CACHE PATH "Installation directory" FORCE)
endif()

# Fully qualified name of the custom manifest dir.
set(FLUTTER_MANAGED_DIR "${CMAKE_CURRENT_SOURCE_DIR}/flutter")

# Standard Flutter plugin build settings.
# Required by plugins (e.g. flutter_secure_storage_linux) that call apply_standard_settings().
function(apply_standard_settings TARGET)
  target_compile_features(${TARGET} PUBLIC cxx_std_14)
  target_compile_options(${TARGET} PRIVATE -Wall -Werror)
  target_compile_options(${TARGET} PRIVATE "$<$<NOT:$<CONFIG:Debug>>:-O2>")
  target_compile_definitions(${TARGET} PRIVATE "$<$<CONFIG:Debug>:_DEBUG>")
endfunction()

# Application build. Provides the flutter_window.h header for the runner target.
add_subdirectory(${FLUTTER_MANAGED_DIR})

# Define the application target BEFORE including generated_plugins.cmake.
# cmake 3.28+ requires a target to exist before target_link_libraries() is called
# on it. generated_plugins.cmake calls target_link_libraries(${BINARY_NAME} ...)
# so the executable must be defined first.
add_executable(${BINARY_NAME}
  "main.cc"
  "my_application.cc"
  "${FLUTTER_MANAGED_DIR}/generated_plugin_registrant.cc"
)

# Apply standard build settings.
apply_standard_settings(${BINARY_NAME})

# Add dependency libraries. Uses pkg-config to find GTK+-3.0.
target_link_libraries(${BINARY_NAME} PRIVATE flutter)
target_link_libraries(${BINARY_NAME} PRIVATE PkgConfig::GTK)

# Generated plugin build rules, which manage building the plugins and adding
# them to the application.
include(flutter/generated_plugins.cmake)

# Run the Flutter tool portions of the build. This must not be removed.
add_dependencies(${BINARY_NAME} flutter_assemble)

# Provide fallback install destinations if not set by generated_config.cmake.
# flutter build linux does not run cmake --install, so these are only needed
# to satisfy cmake's validation during configuration.
if(NOT DEFINED INSTALL_BUNDLE_DATA_DIR OR INSTALL_BUNDLE_DATA_DIR STREQUAL "")
  set(INSTALL_BUNDLE_DATA_DIR "${CMAKE_INSTALL_PREFIX}/data")
endif()
if(NOT DEFINED INSTALL_BUNDLE_LIB_DIR OR INSTALL_BUNDLE_LIB_DIR STREQUAL "")
  set(INSTALL_BUNDLE_LIB_DIR "${CMAKE_INSTALL_PREFIX}/lib")
endif()

# Only the install rules need to be in the top-level rules, since the Flutter
# tool generates the needed files for the runner.
install(TARGETS ${BINARY_NAME} RUNTIME DESTINATION "${CMAKE_INSTALL_PREFIX}"
  COMPONENT Runtime)

install(FILES "${FLUTTER_ICU_DATA_FILE}" DESTINATION "${INSTALL_BUNDLE_DATA_DIR}"
  COMPONENT Runtime)

install(FILES "${FLUTTER_LIBRARY}" DESTINATION "${INSTALL_BUNDLE_LIB_DIR}"
  COMPONENT Runtime)

foreach(bundled_library ${FLUTTER_BUNDLED_LIBRARIES})
  install(FILES "${bundled_library}"
    DESTINATION "${INSTALL_BUNDLE_LIB_DIR}"
    COMPONENT Runtime)
endforeach(bundled_library)
