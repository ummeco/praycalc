# PrayCalc C Core — Makefile
#
# Usage:
#   make          — build the test executable
#   make test     — build and run tests
#   make lib      — build static library (libpraycalc.a)
#   make clean    — remove build artifacts

CC ?= cc
CFLAGS = -std=c99 -Wall -Wextra -Wpedantic -O2
LDFLAGS = -lm

SRCS = nrel_spa.c pray_calc.c qibla.c
OBJS = $(SRCS:.c=.o)
TEST_SRC = test_pray_calc.c
TEST_BIN = test_pray_calc
LIB = libpraycalc.a

.PHONY: all test lib clean

all: $(TEST_BIN)

$(TEST_BIN): $(TEST_SRC) $(SRCS) pray_calc.h nrel_spa.h qibla.h
	$(CC) $(CFLAGS) -o $@ $(TEST_SRC) $(SRCS) $(LDFLAGS)

lib: $(LIB)

$(LIB): $(OBJS)
	ar rcs $@ $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -c -o $@ $<

test: $(TEST_BIN)
	./$(TEST_BIN)

clean:
	rm -f $(TEST_BIN) $(LIB) $(OBJS)
