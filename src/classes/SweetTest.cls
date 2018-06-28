/**
 * MIT License
 *
 * Copyright (c) 2018 Click to Cloud Pty Ltd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/
@isTest
private class SweetTest extends Sweet.BaseEnum {
    public static final SweetTest One = (SweetTest)new SweetTest().setName('One').setOrdinal(0);

    @isTest
    private static void assertNotNullTest() {
        try {
            Sweet.assertNotNull(null, 'Should not be null');
            System.assert(false);
        }
        catch(Sweet.SweetException e) {
            System.assert(true);
        }
    }

    @isTest
    private static void reflectionTest() {
        Sweet.Reflection r = Sweet.reflect(new DummyReflectable());

        System.assertEquals(new List<String>{ 'field' }, r.getFieldNames());
        r.setFieldValue('field', 'value');
        System.assertEquals('value', r.getFieldValue('field'));

        System.assertEquals(new List<String>{ 'method' }, r.getMethodNames());
        System.assertEquals('method', r.invokeMethod('method', new List<Object>()));
    }

    @isTest
    private static void enumTest() {
        System.assertEquals('One', SweetTest.One.toString());
        System.assertEquals(0, SweetTest.One.ordinal());
    }

    @isTest
    private static void anonymousContextTest() {
        Sweet.AnonymousContext c1 = new Sweet.AnonymousContext(null, new Map<String, Object>{ 'a' => 1 });
        Sweet.AnonymousContext c2 = new Sweet.AnonymousContext(c1, new Map<String, Object>{ 'b' => 2 });

        System.assertEquals(2, c2.get('b'));
        System.assertEquals(1, c2.get('a'));
    }

    @isTest
    private static void generateHashCodeTest() {
        Integer a = 1;
        Integer b = 1;
        Integer h1 = Sweet.generateHashCode(a);
        Integer h2 = Sweet.generateHashCode(b);

        System.assertEquals(h1, h2);
    }

    @isTest
    private static void getBeanWithBoundTypeTest() {
        Sweet.bind(Case.class, Account.class);
        Object o = Sweet.getBean(Case.class);
        System.assert(o instanceof Account);

        Sweet.unbind(Case.class);
        o = Sweet.getBean(Case.class);
        System.assert(o instanceof Case);
    }

    @isTest
    private static void getBeanWithNameTest() {
        Object o = Sweet.getBean('demo');
        System.assert(o instanceof Case);
    }

    private class DummyReflectable implements Sweet.Reflectable {
        private Map<String, Object> data = new Map<String, Object>();

        public List<String> reflect_getFieldNames() {
            return new List<String>{ 'field' };
        }

        public Object reflect_getFieldValue(String name) {
            return this.data.get(name);
        }

        public void reflect_setFieldValue(String name, Object value) {
            this.data.put(name, value);
        }

        public List<String> reflect_getMethodNames() {
            return new List<String>{ 'method' };
        }

        public Object reflect_invokeMethod(String name, List<Object> args) {
            return name;
        }
    }
}
