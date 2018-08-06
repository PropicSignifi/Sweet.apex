public class SweetAnnotations implements Sweet.Annotations {
    private final Map<String, List<Object>> annotations = new Map<String, List<Object>>();

    public List<Object> getAnnotations(String name) {
        List<Object> aList = annotations.get(name);
        return aList == null ? new List<Object>() : aList;
    }

    public Object getAnnotation(String name) {
        List<Object> aList = getAnnotations(name);
        return aList.isEmpty() ? null : aList.get(0);
    }

    private void registerAnnotation(String targetName, Object annotation) {
        List<Object> aList = annotations.get(targetName);
        if(aList == null) {
            aList = new List<Object>();
        }
        aList.add(annotation);
        annotations.put(targetName, aList);
    }

    {
        registerAnnotation(AnnotationDemo.class.getName(), new AnnotationDemo.MyAnnotation().name('Test'));
    }
}